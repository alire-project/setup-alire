import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

import fs from 'fs';

import path from "path";

const install_dir : string = "alire_install";

function detect_cached() : boolean {
    const ext = (process.platform == "win32" ? ".exe" : "")
    if (fs.existsSync(path.join(process.cwd(), install_dir, "bin", `alr${ext}`))) {
        console.log("CACHE HIT")
        return true
    } else {
        console.log("CACHE MISS")
        return false
    }
}

async function install_branch(branch : string) {
    const repo_url  : string = "https://github.com/alire-project/alire.git";

    console.log(`Builing alr from branch [${branch}]`)

    await exec.exec(`git clone -b ${branch} ${repo_url} ${install_dir}`);
        const start_path : string = process.cwd()
        process.chdir(install_dir);
        await exec.exec(`git submodule update --init --recursive`);

        switch (process.platform) {
            case "darwin":
                console.log("NOTE: Configuring ENV for macOS");
                process.env.ALIRE_OS = "macos"
                break;
            case "win32":
                console.log("NOTE: Configuring ENV for Windows");
                process.env.ALIRE_OS = "windows"
                break;
            case "linux":
                console.log("NOTE: Configuring ENV for Linux");
                process.env.ALIRE_OS = "linux"
                break;
            case "freebsd":
                console.log("NOTE: Configuring ENV for FreeBSD");
                process.env.ALIRE_OS = "freebsd"
                break;
            default:
                console.log("NOTE: Unknown platform: build will fail");
                process.env.ALIRE_OS = "unknown"
                break;
        }

        await exec.exec(`gprbuild -j0 -p -P alr_env.gpr -cargs -fPIC -largs -static-libgcc`);
        process.chdir(start_path)
}

async function install_release(version : string) {
    const base_url : string = "https://github.com/alire-project/alire/releases/download";

    console.log(`Deploying alr version [${version}]`)

    var arch     : string;
    var infix    : string;
    var platform : string;

    switch (process.arch) {
        case 'arm64':
            arch = "aarch64";
            break;
        default:
            arch = "x86_64";
            break;
    }

    switch(version) {
        case '1.0.1':
            infix = "bin";
            break;
        default:
            infix = `bin-${arch}`;
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

    console.log(`Downloading file: ${url} to ${install_dir}`)
    const dlFile = await tc.downloadTool(url);
    await tc.extractZip(dlFile, install_dir);

    return false
}

async function run() {
    try {
        var version : string
        var branch  : string
        var msys2   : boolean
        var tool_args : string

        if (process.argv[2]) { // e.g., node lib/script.js <json object>
            const inputs = JSON.parse(process.argv[2])

            // Log the inputs for the record
            console.log("Inputs: " + process.argv[2])

            version   = inputs.version
            branch    = inputs.branch
            msys2     = inputs.msys2 == "true";
            tool_args = inputs.toolchain
        } else {
            // Old way in case this is fixed by GH
            version   = core.getInput('version');
            branch    = core.getInput('branch');
            msys2     = core.getInput('msys2') == "true";
            tool_args = core.getInput('toolchain');
        }

        // Install the requested version/branch unless cached
        const cached : boolean = detect_cached()

        if (!cached) {
            if (branch.length == 0) {
                await install_release(version);
            }
            else {
                await install_branch(branch);
            }
        }

        //  Add to path in any case
        core.addPath(path.join(process.cwd(), install_dir, 'bin'));

        //  Identify the major version number to choose between config/settings
        const major : number = parseInt(version.split(".")[0], 10);
        const settings_cmd : string = (major >= 2 ? "settings" : "config");

        //  Disable index auto-refresh asking, that may cause trouble to users
        //  on first run, but only if the major version is >=2, which
        //  introduced the feature.
        if (parseInt(version.split(".")[0], 10) >= 2) {
            await exec.exec(`alr -n settings --global --set index.auto_update_asked true`);
            console.log("Enabled index auto-refresh without further asking.");
        }

        //  Disable msys2 installation if requested
        if (process.platform == "win32") {
            if (msys2) {
                //  Re-enable in case it was disabled during previous actions steps
                await exec.exec(`alr -n ${settings_cmd} --global --set msys2.do_not_install false`);
                console.log(`MSYS2 installation NOT disabled (msys2=${msys2})`);
            } else {
                await exec.exec(`alr -n ${settings_cmd} --global --set msys2.do_not_install true`);
                console.log(`MSYS2 installation DISABLED (msys2=${msys2})`);
            }
        }

        // And configure the toolchain
        if (tool_args.length > 0 && !cached) {
            await exec.exec(`alr -n toolchain ${tool_args != "--disable-assistant" ? "--select " : ""} ${tool_args}`);
            // Disable the assistant anyway if we have selected something. This will no longer be necessary after 1.1.1
            if (tool_args != "--disable-assistant") {
                await exec.exec(`alr -n toolchain --disable-assistant`);
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
