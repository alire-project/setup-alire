# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager.

## Usage

To use the latest binary release of the Alire project, add this line to your workflow steps:
```yaml
    - uses: alire-project/setup-alire@v1
```

To use a development version compiled from sources (if you known what
you are doing), add instead these two steps to you workflow:
```yaml
    - uses: ada-actions/toolchain@ce2020
    - uses: alire-project/setup-alire@v1
      with:
        branch: "master" # or the branch you want to use
```
The first step, in this case, is done to have a GNAT toolchain available to
compile Alire. If you already are setting up GNAT for your needs, this step can
be omitted.

The command line tool `alr` will be available in `PATH`.

More generally, these options are available for the action:

```yaml
inputs:
  version:
    description: Use this argument to install a stable release. Use a version number without v prefix, e.g., 1.0.1, 1.1.0. This argument will be ignored if a branch argument is supplied. Defaults to the latest stable release.
    required: false
    default: '1.1.0'
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
```