import * as core from '@actions/core';
import * as exec from '@actions/exec';
const path = require("path");

const repo_url="https://github.com/alire-project/alire.git";
const repo_branch="master";
const alire_src="alire_install"; // To match the latest-stable install path

async function run() {
    try {
        await exec.exec(`git clone -b ${repo_branch} ${repo_url} ${alire_src}`);
        process.chdir(alire_src);
        await exec.exec(`git submodule update --init --recursive`);
        
        if (process.platform == "darwin") {
            process.env.OS = "macOS"
            console.log("NOTE: Configuring ENV for macOS")
        } else {
            console.log("NOTE: Configuring ENV for Linux/Windows")
        }
        
        await exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr -cargs -fPIC`);

        core.addPath(path.join(process.cwd(), 'bin'));

        const tool_args : string = core.getInput('toolchain');
        const tool_dir  : string = core.getInput('toolchain_dir');

        if (tool_args.length > 0) {
            await exec.exec(`alr -n toolchain ${tool_args != "--disable-assistant" ? "--select " : ""} `
                            + `${tool_args}` 
                            + `${tool_dir.length > 0 ? " --install-dir " + tool_dir : ""}`);
        }

        // For some reason, this makes the action step to never finish on Windows
        if (process.platform != "win32") {
            console.log("Built version:");
            await exec.exec(`alr -n version`);
        }
        console.log("SUCCESS");
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed("Unknown error situation");
        }
    }
}

run();
