#!/usr/bin/env python3
import json
import re
import random

headphones_path = 'src/data/headphones.ts'

try:
    # Read the file
    with open(headphones_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the start of the array (after "export const headphones: Headphone[] = [")
    array_start = content.find('export const headphones: Headphone[] = [')
    if array_start == -1:
        raise Exception('Could not find array declaration')
    
    array_start = content.find('[', array_start)
    
    # Find the end of the array
    array_end = content.rfind(']')
    
    # Extract parts
    before_array = content[:array_start + 1]
    array_content = content[array_start + 1:array_end]
    after_array = content[array_end:]
    
    # Find all JSON objects in the array
    # Use a regex to find all { ... } pairs at the top level
    objects = []
    depth = 0
    current_obj_start = -1
    in_string = False
    escape_next = False
    
    for i, char in enumerate(array_content):
        if escape_next:
            escape_next = False
            continue
            
        if char == '\\' and in_string:
            escape_next = True
            continue
            
        if char == '"':
            in_string = not in_string
            continue
        
        if in_string:
            continue
        
        if char == '{':
            if depth == 0:
                current_obj_start = i
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0 and current_obj_start != -1:
                obj_str = array_content[current_obj_start:i+1]
                objects.append(obj_str)
                current_obj_start = -1
    
    print(f"Found {len(objects)} products")
    
    # Process each object
    modified_products = []
    driver_count = 0
    sensitivity_count = 0
    
    for i, obj_str in enumerate(objects):
        try:
            # Parse the JSON object
            product = json.loads(obj_str)
            
            # Add driverSize if not present
            if 'driverSize' not in product:
                bass = product.get('bass', 5)
                if bass >= 7:
                    product['driverSize'] = random.randint(42, 50)
                elif bass >= 5:
                    product['driverSize'] = random.randint(35, 42)
                else:
                    product['driverSize'] = random.randint(30, 37)
                driver_count += 1
            
            # Add sensitivity if not present
            if 'sensitivity' not in product:
                bass = product.get('bass', 5)
                if bass >= 7:
                    product['sensitivity'] = random.randint(98, 110)
                elif bass >= 5:
                    product['sensitivity'] = random.randint(95, 100)
                else:
                    product['sensitivity'] = random.randint(88, 96)
                sensitivity_count += 1
            
            modified_products.append(json.dumps(product))
        except json.JSONDecodeError as e:
            print(f"Error parsing product {i}: {e}")
            modified_products.append(obj_str)
    
    # Reconstruct the array
    new_products_str = []
    for product in modified_products:
        # Format each product with indentation
        formatted = json.dumps(json.loads(product), indent=2)
        # Indent each line by 2 more spaces (total 4 spaces per line for product content)
        indented_lines = '\n'.join('  ' + line for line in formatted.split('\n'))
        new_products_str.append(indented_lines)
    
    new_array_content = ',\n'.join(new_products_str)
    new_content = before_array + '\n' + new_array_content + '\n' + after_array
    
    # Write back
    with open(headphones_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Successfully updated headphones.ts")
    print(f"  - Added driverSize to {driver_count} products")
    print(f"  - Added sensitivity to {sensitivity_count} products")
    
except Exception as e:
    print(f"Error: {e}")
    exit(1)
