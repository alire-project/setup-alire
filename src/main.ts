import * as core from '@actions/core';
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

        const dlFile = await tc.downloadTool(url);
        tc.extractZip(dlFile, "alire_install");

        core.addPath(path.join(process.cwd(), "alire_install", 'bin'));

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
