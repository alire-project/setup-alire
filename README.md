# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager.

## Usage

To use the latest stable release of the Alire project, add this line to your
workflow steps (you can of course pin to a version or commit rather than using `latest`):
```yaml
    - uses: alire-project/setup-alire@latest
```

To use a precompiled nightly build of the development version, use the following:
```yaml
    - uses: alire-project/setup-alire@latest
      with:
        version: "nightly"
```

To use a development version compiled from sources (if you known what
you are doing), use the following:
```yaml
    - uses: alire-project/setup-alire@latest
      with:
        branch: "master" # or the branch you want to use
```

For building from sources, the action will detect whether a GNAT is already in
the PATH. If not, one will be installed to be able to build `alr`.

The command-line tool `alr` will be available in `PATH` after the action
completes.

Check the [action.yml](action.yml) file for more details on the available inputs.