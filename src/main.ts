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
        }
        
        await exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr -cargs -fPIC`);

        core.addPath(path.join(process.cwd(), 'bin'));
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
