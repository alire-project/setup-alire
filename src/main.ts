import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

import fs from 'fs';

import path from "path";

const install_dir : string = "alire_install";

async function install_branch(branch : string) {
    const repo_url  : string = "https://github.com/alire-project/alire.git";

    console.log(`Builing alr from branch [${branch}]`)

    await exec.exec(`git clone -b ${branch} ${repo_url} ${install_dir}`);
        process.chdir(install_dir);
        await exec.exec(`git submodule update --init --recursive`);

        if (process.platform == "darwin") {
            process.env.OS = "macOS"
            console.log("NOTE: Configuring ENV for macOS")
        } else {
            console.log("NOTE: Configuring ENV for Linux/Windows")
        }

        await exec.exec(`gprbuild -j0 -p -P alr_env.gpr -cargs -fPIC`);

        core.addPath(path.join(process.cwd(), 'bin'));
}

async function install_release(version : string) : Promise<boolean> { // Return if it was cached
    const base_url : string = "https://github.com/alire-project/alire/releases/download";

    console.log(`Deploying alr version [${version}]`)

    var infix    : string;
    var platform : string;

    switch(version) {
        case '1.0.1':
            infix = "bin";
            break;
        default:
            infix = "bin-x86_64";
            break;
    }

    switch (process.platform) {
        case 'linux':
            platform = "linux";
            break;
        case 'darwin':
            platform = "macos";
            break;
        case 'win32':
            platform = "windows";
            break;
        default:
            throw new Error('Unknown platform ' + process.platform);
    }

    const v : string = (version == "nightly" ? "" : "v")

    const filename : string = `alr-${version}-${infix}-${platform}.zip`
    const url : string = `${base_url}/${v}${version}/${filename}`;

    //  Add to path in any case
    core.addPath(path.join(process.cwd(), install_dir, 'bin'));

    // Check if this install is cached
    if (fs.existsSync(`${install_dir}/${filename}`)) {
        console.log(`CACHE HIT: reusing installation of ${filename}`)
        return true
    }

    console.log(`Downloading file: ${url} to ${install_dir}`)
    const dlFile = await tc.downloadTool(url);
    await tc.extractZip(dlFile, install_dir);

    return false
}

async function run() {
    try {
        var version : string
        var branch  : string
        var tool_args : string
        var tool_dir  : string

        if (process.argv[2]) { // e.g., node lib/script.js <json object>
            const inputs = JSON.parse(process.argv[2])
            version   = inputs.version
            branch    = inputs.branch
            tool_args = inputs.toolchain
            tool_dir  = inputs.toolchain_dir
        } else {
            // Old way in case this is fixed by GH
            version   = core.getInput('version');
            branch    = core.getInput('branch');
            tool_args = core.getInput('toolchain');
            tool_dir  = core.getInput('toolchain_dir');
        }

        // Install the requested version/branch
        var cached : boolean
        if (branch.length == 0) {
            cached = await install_release(version);
        }
        else {
            await install_branch(branch);
            cached = false
        }

        // And configure the toolchain
        if (tool_args.length > 0 && !cached) {
            if (tool_dir.length == 0) {
                await exec.exec(`alr -n toolchain ${tool_args != "--disable-assistant" ? "--select " : ""} ${tool_args}`);
                // Disable the assistant anyway if we have selected something. This will no longer be necessary after 1.1.1
                if (tool_args != "--disable-assistant") {
                    await exec.exec(`alr -n toolchain --disable-assistant`);
                }
            } else {
                await exec.exec(`alr -n toolchain --install ${tool_args} --install-dir ${tool_dir}`);
            }
        }

        // Show the alr now in the environment and the configured toolchain
        console.log("Installed alr version and GNAT toolchain:");
        await exec.exec(`alr -n version`);
        await exec.exec(`alr -n toolchain`);

        console.log("SUCCESS");

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.stack);
            core.setFailed(error.message);
        }
        else {
            core.setFailed("Unknown error situation");
        }
    }
}

run();
