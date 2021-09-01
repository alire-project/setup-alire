"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const repo_url = "https://github.com/alire-project/alire.git";
const repo_branch = "master";
const alire_src = "alire_install"; // To match the latest-stable install path
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec(`git clone -b ${repo_branch} ${repo_url} ${alire_src}`);
            process.chdir(alire_src);
            yield exec.exec(`git submodule update --init --recursive`);
            if (process.platform == "darwin") {
                process.env.OS = "macOS";
                console.log("NOTE: Configuring ENV for macOS");
            }
            else {
                console.log("NOTE: Configuring ENV for Linux/Windows");
            }
            yield exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr -cargs -fPIC`);
            core.addPath(path.join(process.cwd(), 'bin'));
            yield exec.exec(`alr -n toolchain --disable-assistant`);
            // For some reason, this makes the action step to never finish on Windows
            if (process.platform != "win32") {
                console.log("Built version:");
                yield exec.exec(`alr -n version`);
            }
            console.log("SUCCESS");
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
