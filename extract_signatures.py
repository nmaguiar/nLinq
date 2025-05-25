import re
import os

js_file_path = "src/nlinq.js"
actual_js_code = ""
try:
    with open(js_file_path, "r") as f:
        actual_js_code = f.read()
except FileNotFoundError:
    print(f"Error: File not found at {js_file_path}")
    exit(1)

method_names = set()

# Isolate the 'var code = {...};' block
code_block_match = re.search(r"var code\s*=\s*{((?:.|\n)*?)};", actual_js_code)

if code_block_match:
    code_block_content = code_block_match.group(1)

    # Simplified regex to find lines that likely define methods (name : function or name : arrow function)
    # This will just grab the name for now.
    method_name_pattern = re.compile(
        r"^\s*([a-zA-Z0-9_]+)\s*:\s*(?:function|\([^)]*\)\s*=>|\w+\s*=>)"
        , re.MULTILINE
    )

    for match in method_name_pattern.finditer(code_block_content):
        method_names.add(match.group(1) + "()") # Add () for now, params later

# Sort alphabetically for consistent output
sorted_method_names = sorted(list(method_names))

for name in sorted_method_names:
    print(name)
