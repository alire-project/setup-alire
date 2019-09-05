import * as core from '@actions/core';
import * as exec from '@actions/exec';
const path = require("path");

const repo_url="https://github.com/alire-project/alire.git";
const repo_branch="master";
const alire_src="alire_src";

async function run() {
    try {
        if (process.platform != 'linux') {
            core.setFailed(`Alire is not available on ${process.platform} yet`);
            return;
        }

        await exec.exec('sudo apt install gnat gprbuild');
        await exec.exec(`git clone -b ${repo_branch} ${repo_url} ${alire_src}`);
        process.chdir(alire_src);
        await exec.exec(`git submodule update --init --recursive`);
        await exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr`);

        core.addPath(path.join(process.cwd(), 'bin'));
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
