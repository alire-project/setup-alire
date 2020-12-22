# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager.

## Usage

To use the latest binary release of the Alire project, add this line to your workflow steps:
```
    - uses: alire-project/setup-alire@latest-stable
```

To use the latest development version compiled from sources (if you known what
you are doing), add instead these two steps to you workflow:
```
    - uses: ada-actions/toolchain@ce2020
    - uses: alire-project/setup-alire@latest-devel
```
The first step, in this case, is done to have a GNAT toolchain available to
compile Alire. If you already are setting up GNAT for your needs, this step can
be omitted.

The command line tool `alr` will be available in `PATH`.
