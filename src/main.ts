import * as core from '@actions/core';
import * as exec from '@actions/exec';
const path = require("path");


// This comes from https://github.com/actions/toolkit/blob/master/packages/tool-cache/src/tool-cache.ts
// It would be nice to have an API to get the tempDirectory path.

const IS_WINDOWS = process.platform === 'win32'
const userAgent = 'actions/tool-cache'

// On load grab temp directory and cache directory and remove them from env (currently don't want to expose this)
let tempDirectory: string = process.env['RUNNER_TEMP'] || ''
let cacheRoot: string = process.env['RUNNER_TOOL_CACHE'] || ''
// If directories not found, place them in common temp locations
if (!tempDirectory || !cacheRoot) {
  let baseLocation: string
  if (IS_WINDOWS) {
    // On windows use the USERPROFILE env variable
    baseLocation = process.env['USERPROFILE'] || 'C:\\'
  } else {
    if (process.platform === 'darwin') {
      baseLocation = '/Users'
    } else {
      baseLocation = '/home'
    }
  }
  if (!tempDirectory) {
    tempDirectory = path.join(baseLocation, 'actions', 'temp')
  }
  if (!cacheRoot) {
    cacheRoot = path.join(baseLocation, 'actions', 'cache')
  }
}

const repo_url="https://github.com/alire-project/alire.git";
const repo_branch="master";
const alire_src=path.join(tempDirectory, "alire_src");

async function run() {
    try {
        if (process.platform != 'linux') {
            core.setFailed(`Alire is not available on ${process.platform} yet`);
            return;
        }

        await exec.exec('sudo apt install gnat-9 gprbuild');
        await exec.exec(`git clone -b ${repo_branch} ${repo_url} ${alire_src}`);
        process.chdir(alire_src);
        await exec.exec(`git submodule update --init --recursive`);
        await exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr -cargs -fPIC`);

        core.addPath(path.join(process.cwd(), 'bin'));
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
