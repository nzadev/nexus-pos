#!/usr/bin/env bash
set -euo pipefail

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
PROJECT_DIR="$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)"
if [ ! -d "$PROJECT_DIR/.git" ]; then
  PROJECT_DIR="/home/nza/Projects/mini-pos"
fi
ZIP_TARGET="/home/nza/Projects/Tugas_Proyek_NexusPOS.zip"
BRANCH_TARGET="main"

echo "=== Nexus POS Automated Deployment ==="
echo "Target Direktori: ${PROJECT_DIR}"

cd "${PROJECT_DIR}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Error: Direktori bukan repositori git valid." >&2
    exit 1
fi

COMMIT_MSG="${1:-update: pembaruan fitur dan sinkronisasi tampilan POS $(date '+%Y-%m-%d %H:%M:%S')}"

echo "Menyiapkan berkas untuk di-commit..."
git add -A

if git diff-index --quiet HEAD --; then
    echo "Tidak ada perubahan berkas baru untuk di-commit."
else
    echo "Membuat commit: ${COMMIT_MSG}"
    git commit -m "${COMMIT_MSG}"
fi

echo "Mendorong perubahan ke GitHub (origin/${BRANCH_TARGET})..."
git push origin "${BRANCH_TARGET}"

if command -v zip >/dev/null 2>&1; then
    echo "Memperbarui arsip tugas proyek zip..."
    zip -q -r -9 "${ZIP_TARGET}" . -x ".git/*" -x ".git"
    echo "Arsip tersimpan di: ${ZIP_TARGET}"
fi

echo "=== Deployment Berhasil ==="
echo "URL GitHub Repo  : https://github.com/nzadev/nexus-pos"
echo "URL GitHub Pages : https://nzadev.github.io/nexus-pos/"
