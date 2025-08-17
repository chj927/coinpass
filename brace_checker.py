import re

def analyze_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    brace_balance = 0
    problematic_lines = []
    
    for i, line in enumerate(lines, 1):
        # Skip lines that are comments or strings
        clean_line = line
        
        # Remove single line comments
        if '//' in clean_line:
            comment_pos = clean_line.find('//')
            # Check if it's really a comment (not inside a string)
            before_comment = clean_line[:comment_pos]
            single_quotes = before_comment.count("'") - before_comment.count("\\'")
            double_quotes = before_comment.count('"') - before_comment.count('\\"')
            if single_quotes % 2 == 0 and double_quotes % 2 == 0:
                clean_line = clean_line[:comment_pos]
        
        # Count braces in this line
        line_open = clean_line.count('{')
        line_close = clean_line.count('}')
        old_balance = brace_balance
        brace_balance += line_open - line_close
        
        if line_open > 0 or line_close > 0:
            print(f"Line {i}: '{line.strip()}' -> +{line_open} -{line_close} (balance: {old_balance} -> {brace_balance})")
            
        if brace_balance < 0:
            problematic_lines.append(i)
    
    print(f"\nFinal balance: {brace_balance}")
    if brace_balance != 0:
        print(f"ERROR: Unmatched braces! Missing {abs(brace_balance)} {'closing' if brace_balance > 0 else 'opening'} brace(s)")
    
    if problematic_lines:
        print(f"Lines where balance went negative: {problematic_lines}")

if __name__ == "__main__":
    analyze_braces("admin.tsx")