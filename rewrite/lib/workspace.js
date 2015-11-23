// dapple workspace and dev environment object
// all interactions with the filestystem should be contained to this module
// dapplerc, dappfile, subpackages, etc

/*
A workspace will be initialized when you run any `dapple` command. It is dapple's
internal configuration object and single point of interaction with the filesystem.

It will look for the `.dapplerc` file in `DAPPLERC` env var or `~/.dapplerc`
It will look for the `dappfile` in all parents in order (like `git` command and `.git` folder)
*/

"use strict";
var yaml = require("read-yaml");
var fs = require("./file");
var readdir = require("fs-readdir-recursive");
var constants = require("./constants");
var path = require("path");

module.exports = class Workspace {
    constructor(path) {
        if( path === undefined ) {
            path = process.cwd();
        }
        this.package_root = this.findWorkspaceRoot(path);
        if( this.package_root === undefined ) {
            throw "Couldn't find workspace. Use `dapple init`"
        }
        this.loadDappfile();
    }
    getBuildDir() {
        return this.package_root +"/"+ this.dappfile["build_dir"];
    }
    findWorkspaceRoot(command_dir) {
        var location = command_dir;
        do {
            var dappfile_path = path.join(location, constants.DAPPFILE_FILENAME );
            if( fs.existsSync(dappfile_path) ) {
                return location;
            }
            location = path.join(location, "..");
        } while( location != "/" );
        return undefined;
    }
    loadDappfile(path) {
        if( path === undefined ) {
            path = this.package_root +"/"+ constants.DAPPFILE_FILENAME;
        }
        this.dappfile = yaml.sync(path);
    }
    // get solidity source files for just this package - no sub-packages
    loadWorkspaceSources() {
        var dir = this.package_root +"/" + this.dappfile["sol_sources"];
        var files = readdir(dir);
        files = files.filter(function(file) {
            return file.endsWith(".sol");
        });
        var sources = {};
        files.forEach(function(file) {
            var origin = dir +"/"+ file;
            sources[file] = fs.readFileStringSync(origin);
        });
        return sources;
    }
}