"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const tc = __importStar(require("@actions/tool-cache"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const install_dir = "alire_install";
function detect_cached() {
    const ext = (process.platform == "win32" ? ".exe" : "");
    if (fs_1.default.existsSync(path_1.default.join(process.cwd(), install_dir, "bin", `alr${ext}`))) {
        console.log("CACHE HIT");
        return true;
    }
    else {
        console.log("CACHE MISS");
        return false;
    }
}
function install_branch(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo_url = "https://github.com/alire-project/alire.git";
        console.log(`Builing alr from branch [${branch}]`);
        yield exec.exec(`git clone -b ${branch} ${repo_url} ${install_dir}`);
        const start_path = process.cwd();
        process.chdir(install_dir);
        yield exec.exec(`git submodule update --init --recursive`);
        switch (process.platform) {
            case "darwin":
                console.log("NOTE: Configuring ENV for macOS");
                process.env.ALIRE_OS = "macos";
                break;
            case "win32":
                console.log("NOTE: Configuring ENV for Windows");
                process.env.ALIRE_OS = "windows";
                break;
            case "linux":
                console.log("NOTE: Configuring ENV for Linux");
                process.env.ALIRE_OS = "linux";
                break;
            case "freebsd":
                console.log("NOTE: Configuring ENV for FreeBSD");
                process.env.ALIRE_OS = "freebsd";
                break;
            default:
                console.log("NOTE: Unknown platform: build will fail");
                process.env.ALIRE_OS = "unknown";
                break;
        }
        yield exec.exec(`gprbuild -j0 -p -P alr_env.gpr -cargs -fPIC -largs -static-libgcc`);
        process.chdir(start_path);
    });
}
function install_release(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const base_url = "https://github.com/alire-project/alire/releases/download";
        console.log(`Deploying alr version [${version}]`);
        var arch;
        var infix;
        var platform;
        switch (process.arch) {
            case 'arm64':
                arch = "aarch64";
                break;
            default:
                arch = "x86_64";
                break;
        }
        switch (version) {
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
        const v = (version == "nightly" ? "" : "v");
        const filename = `alr-${version}-${infix}-${platform}.zip`;
        const url = `${base_url}/${v}${version}/${filename}`;
        console.log(`Downloading file: ${url} to ${install_dir}`);
        const dlFile = yield tc.downloadTool(url);
        yield tc.extractZip(dlFile, install_dir);
        return false;
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var version;
            var branch;
            var msys2;
            var tool_args;
            if (process.argv[2]) { // e.g., node lib/script.js <json object>
                const inputs = JSON.parse(process.argv[2]);
                // Log the inputs for the record
                console.log("Inputs: " + process.argv[2]);
                version = inputs.version;
                branch = inputs.branch;
                msys2 = inputs.msys2 == "true";
                tool_args = inputs.toolchain;
            }
            else {
                // Old way in case this is fixed by GH
                version = core.getInput('version');
                branch = core.getInput('branch');
                msys2 = core.getInput('msys2') == "true";
                tool_args = core.getInput('toolchain');
            }
            //  Identify the major version number to choose between config/settings
            const major = parseInt(version.split(".")[0], 10);
            const settings_cmd = (major >= 2 ? "settings" : "config");
            // Fail if version <2 and msys2=false (we cannot honor that)
            if (major < 2 && !msys2 && process.platform == "win32") {
                throw new Error("MSYS2 installation is mandatory for alr<2.0");
            }
            // Install the requested version/branch unless cached
            const cached = detect_cached();
            if (!cached) {
                if (branch.length == 0) {
                    yield install_release(version);
                }
                else {
                    yield install_branch(branch);
                }
            }
            //  Add to path in any case
            core.addPath(path_1.default.join(process.cwd(), install_dir, 'bin'));
            //  Disable index auto-refresh asking, that may cause trouble to users
            //  on first run, but only if the major version is >=2, which
            //  introduced the feature.
            if (parseInt(version.split(".")[0], 10) >= 2) {
                yield exec.exec(`alr -n settings --global --set index.auto_update_asked true`);
                console.log("Enabled index auto-refresh without further asking.");
            }
            //  Disable msys2 installation if requested
            if (process.platform == "win32") {
                if (msys2) {
                    //  Re-enable in case it was disabled during previous actions steps
                    yield exec.exec(`alr -n ${settings_cmd} --global --set msys2.do_not_install false`);
                    console.log(`MSYS2 installation NOT disabled (msys2=${msys2})`);
                }
                else {
                    yield exec.exec(`alr -n ${settings_cmd} --global --set msys2.do_not_install true`);
                    console.log(`MSYS2 installation DISABLED (msys2=${msys2})`);
                }
            }
            // And configure the toolchain
            if (tool_args.length > 0 && !cached) {
                yield exec.exec(`alr -n toolchain ${tool_args != "--disable-assistant" ? "--select " : ""} ${tool_args}`);
                // Disable the assistant anyway if we have selected something. This will no longer be necessary after 1.1.1
                if (tool_args != "--disable-assistant") {
                    yield exec.exec(`alr -n toolchain --disable-assistant`);
                }
            }
            // Show the alr now in the environment and the configured toolchain
            console.log("Installed alr version and GNAT toolchain:");
            yield exec.exec(`alr -n version`);
            yield exec.exec(`alr -n toolchain`);
            console.log("SUCCESS");
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(error.stack);
                core.setFailed(error.message);
            }
            else {
                core.setFailed("Unknown error situation");
            }
        }
    });
}
run();
