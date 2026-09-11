# Third-Party Source Audit

Updated: September 11, 2026

HARIKOS is closed source for now. This audit distinguishes normal package
dependencies from copied or vendored source.

The repository tree and import graph showed no tracked vendor trees, copied
third-party repositories, or embedded implementations from Tree-sitter, Aider,
CodeGraph, projectmem, Qarinah, or Mem0. Historical documents mentioned these
projects as research references, but those statements are not proof of imported
code and do not define production architecture.

HARIKOS uses ordinary package-manager dependencies. Their upstream licenses
continue to apply. Any future decision to import or adapt third-party source
requires a separate provenance and license review before code is added.
