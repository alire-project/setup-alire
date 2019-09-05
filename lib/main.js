"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const path = require("path");
// This comes from https://github.com/actions/toolkit/blob/master/packages/tool-cache/src/tool-cache.ts
// It would be nice to have an API to get the tempDirectory path.
const IS_WINDOWS = process.platform === 'win32';
const userAgent = 'actions/tool-cache';
// On load grab temp directory and cache directory and remove them from env (currently don't want to expose this)
let tempDirectory = process.env['RUNNER_TEMP'] || '';
let cacheRoot = process.env['RUNNER_TOOL_CACHE'] || '';
// If directories not found, place them in common temp locations
if (!tempDirectory || !cacheRoot) {
    let baseLocation;
    if (IS_WINDOWS) {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    }
    else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
    }
    if (!tempDirectory) {
        tempDirectory = path.join(baseLocation, 'actions', 'temp');
    }
    if (!cacheRoot) {
        cacheRoot = path.join(baseLocation, 'actions', 'cache');
    }
}
const repo_url = "https://github.com/alire-project/alire.git";
const repo_branch = "master";
const alire_src = path.join(tempDirectory, "alire_src");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (process.platform != 'linux') {
                core.setFailed(`Alire is not available on ${process.platform} yet`);
                return;
            }
            yield exec.exec('sudo apt install gnat gprbuild');
            yield exec.exec(`git clone -b ${repo_branch} ${repo_url} ${alire_src}`);
            process.chdir(alire_src);
            yield exec.exec(`git submodule update --init --recursive`);
            yield exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr -cargs -fPIC`);
            core.addPath(path.join(process.cwd(), 'bin'));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
