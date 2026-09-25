// PreToolUse guard. Salvaged audit content is imported verbatim (spec §11.1), so Claude
// may not edit anything under docs/salvage/. Exit code 2 blocks the tool call and shows
// stderr to Claude.
let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  const toolInput = JSON.parse(raw || '{}').tool_input ?? {};
  const path = toolInput.file_path ?? toolInput.notebook_path ?? '';
  if (('/' + path.replace(/\\/g, '/')).includes('/docs/salvage/')) {
    process.stderr.write(
      `Blocked: ${path} is salvaged source material and stays verbatim (spec §11.1). ` +
      'Ask the owner before changing it.\n'
    );
    process.exit(2);
  }
});
