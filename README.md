# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager.

## Usage

Requires a valid GNAT toolchain already set up in the workflow (for the
`latest-devel` branch only).

Add this line to your workflow steps:
```
    - uses: alire-project/setup-alire@latest-devel
```

Optional parameters are
```
    - with:
      - toolchain: "gnat_native gprbuild<2000"
      # Arguments to `alr toolchain`. Use `--disable-assistant` for pre-1.1 behavior
      - toolchain_dir: ""
      # Location where toolchains will be installed"
```

The command line tool `alr` will be available in `PATH`.
