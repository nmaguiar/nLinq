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
    
    lines = code_block_content.splitlines()
    
    # Regex for a line: methodName : function(...) or methodName : (...) => or methodName : param =>
    line_regex = re.compile(
        r"^\s*([a-zA-Z0-9_]+)\s*:\s*(?:function\s*\(.*?\)|(\(.*?\)|\w+)\s*=>)"
    )

    for line in lines:
        match = line_regex.match(line.strip())
        if match:
            method_names.add(match.group(1))

# Pattern 2: code.methodName = ... (for methods defined outside the main object)
# This is less likely for the bulk of methods in this file.
pattern2_regex = re.compile(r"code\.([a-zA-Z0-9_]+)\s*=\s*(?:function\s*\(.*?\)|(\(.*?\)|\w+)\s*=>)")
for match in pattern2_regex.finditer(actual_js_code): # Search whole file
    method_names.add(match.group(1))


# Sort alphabetically for consistent output
sorted_method_names = sorted(list(method_names))

if not sorted_method_names:
    print("No method names found.")
else:
    for name in sorted_method_names:
        print(name)
