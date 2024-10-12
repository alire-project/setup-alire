# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager.

Version v2 adds caching to speed up deployment, particularly on Windows.

## Usage

To use the latest stable release of the Alire project, add this line to your workflow steps:
```yaml
    - uses: alire-project/setup-alire@v3
```

To use a precompiled nightly build of the development version, use the following:
```yaml
    - uses: alire-project/setup-alire@v3
      with:
        version: "nightly"
```

To use a development version compiled from sources (if you known what
you are doing), use the following:
```yaml
    - uses: alire-project/setup-alire@v3
      with:
        branch: "master" # or the branch you want to use
```

For building from sources, the action will detect whether a GNAT is already in
the PATH. If not, one will be installed to be able to build `alr`.

The command-line tool `alr` will be available in `PATH` after the action
completes.

More generally, these options are available for the action:

```yaml
inputs:
  version:
    description: Use this argument to install a stable release. Use a version number without v prefix, e.g., 1.0.1, 1.1.0. This argument will be ignored if a branch argument is supplied. Defaults to the latest stable release.
    required: false
    default: '2.0.0'
  branch:
    description: Use this argument to install a development branch (e.g., master). Using this option will require a preexisting compiler in the workflow environment.
    required: false
    default: ''
  toolchain:
    description: Arguments to pass to `alr toolchain` after setup.
    required: false
    default: 'gnat_native gprbuild'
  toolchain_dir:
    description: Location to install the toolchain under.
    required: false
    default: ''
  cache:
    description: Whether to reuse a cached previous install.
    required: false
    default: true
```