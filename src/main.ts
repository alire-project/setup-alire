import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

const path = require("path");

const ver="1.1.0"
const base_url="https://github.com/alire-project/alire/releases/download/";
const linux_url = base_url + "v" + ver + "/alr-" + ver + "-bin-x86_64-linux.zip";
const darwin_url= base_url + "v" + ver + "/alr-" + ver + "-bin-x86_64-macos.zip";
const win32_url = base_url + "v" + ver + "/alr-" + ver + "-bin-x86_64-windows.zip";

async function run() {
    try {
        var url;
        switch (process.platform) {
        case 'linux':
            url = linux_url;
            break;
        case 'darwin':
            url = darwin_url;
            break;
        case 'win32':
            url = win32_url;
            break;
        default:
            throw new Error('Unknown platform ' + process.platform);
        }

        console.log(`Downloading file: ${url}`)
        const dlFile = await tc.downloadTool(url);
        tc.extractZip(dlFile, "alire_install");

        core.addPath(path.join(process.cwd(), "alire_install", 'bin'));

        const tool_args : string = core.getInput('toolchain');
        const tool_dir  : string = core.getInput('toolchain_dir');

        if (tool_args.length > 0) {
            if (tool_dir.length == 0) {
                await exec.exec(`alr -n toolchain ${tool_args != "--disable-assistant" ? "--select " : ""} ${tool_args}`);
            } else {
                await exec.exec(`alr -n toolchain --install ${tool_args} --install-dir ${tool_dir}`);
            }
        }

        // For some reason, this makes the action step to never finish on Windows
        if (process.platform != "win32") {
            console.log("Installed version:");
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
