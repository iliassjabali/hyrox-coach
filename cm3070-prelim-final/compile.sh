#!/bin/sh
# Compiles main.tex -> main.pdf using a texlive Docker image (no local LaTeX install needed).
set -e
cd "$(dirname "$0")"

docker run --rm -v "$PWD":/work -w /work texlive/texlive:latest-medium sh -c "
  tlmgr install ieeetran >/dev/null 2>&1
  pdflatex -interaction=nonstopmode -halt-on-error main.tex >/dev/null
  bibtex main
  pdflatex -interaction=nonstopmode -halt-on-error main.tex >/dev/null
  pdflatex -interaction=nonstopmode -halt-on-error main.tex
"

cp main.pdf "report-$(date +%Y-%m-%d_%H%M%S).pdf"
