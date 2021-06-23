"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const path = require("path");
const ver = "1.0.1";
const base_url = "https://github.com/alire-project/alire/releases/download/";
const linux_url = base_url + "v" + ver + "/alr-" + ver + "-bin-linux.zip";
const darwin_url = base_url + "v" + ver + "/alr-" + ver + "-bin-macos.zip";
const win32_url = base_url + "v" + ver + "/alr-" + ver + "-bin-windows.zip";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const dlFile = yield tc.downloadTool(url);
            tc.extractZip(dlFile, "alire_install");
            core.addPath(path.join(process.cwd(), "alire_install", 'bin'));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
