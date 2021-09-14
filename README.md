# Setup Alire Action

GitHub action to setup Alire, the Ada/SPARK package manager, from the
development branch. This action also takes care of setting up a compiler to
carry out the build.

## Usage

Add this line to your workflow steps:
```
    - uses: alire-project/setup-alire@latest-devel-self-build
```

Optional parameters are
```
    - with:
      - toolchain: "gnat_native gprbuild"
      # Arguments to `alr toolchain`. Use `--disable-assistant` for pre-1.1 behavior
      - toolchain_dir: ""
      # Location where toolchains will be installed"
```

The command line tool `alr` will be available in `PATH`.
