import os
import shutil
import sys

SOURCE_DIR = "/Users/ravishankar/ravi-app-studio/Organized_Files/Documents"
BASE_DIR = "/Users/ravishankar/ravi-app-studio/Organized_Files"

DRY_RUN = True
if len(sys.argv) > 1 and sys.argv[1] == "--execute":
    DRY_RUN = False

def route_file(filename):
    lower_name = filename.lower()
    ext = os.path.splitext(lower_name)[1][1:]
    
    # 1. Immigration
    if any(k in lower_name for k in ['passport', 'brp', 'visa', 'share_your_status']):
        return "Important_Documents/Immigration"
    
    # 2. Finance
    if any(k in lower_name for k in ['accountstatement', 'credit report', 'pension', 'hsbc', 'invoice', 'bill', 'tax']):
        return "Important_Documents/Finance"
        
    # 3. Medical
    if any(k in lower_name for k in ['blood report', 'vitality', 'medical']):
        return "Important_Documents/Medical"
        
    # 4. Legal / Housing
    if any(k in lower_name for k in ['plot', 'hillview', 'license', 'driving']):
        return "Important_Documents/Legal_Housing"
        
    # 5. Software Installers
    if ext in ['dmg', 'pkg', 'app']:
        return "Archives/Software_Installers"
        
    # 6. Android Backups
    if ext == 'bak':
        return "Backups/Android_Backups"
        
    # 7. Media (Audio/Video)
    if ext in ['m4a', 'mp4', 'zoom', 'mov', 'tmp'] and any(k in lower_name for k in ['audio', 'video', 'zoom']):
        return "Media/Audio_Video"
        
    # 8. Images / Photos
    if ext in ['jpg', 'jpeg', 'png', 'heic']:
        return "Images/Photos"
        
    # 9. Developer Junk
    if ext in ['plist', 'dylib', 'xml', 'sh', 'json', 'prl', 'py', 'h', 'strings', 'stringsdict', 'mom', 'car', 'icns', 'bak']:
        return "Automation/System_Configs"
        
    return None

def main():
    print("Starting categorization...")
    if DRY_RUN:
        print("--- DRY RUN MODE: No files will be moved ---")
    else:
        print("--- EXECUTE MODE: Moving files safely ---")
        
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: {SOURCE_DIR} does not exist.")
        return
        
    files = [f for f in os.listdir(SOURCE_DIR) if os.path.isfile(os.path.join(SOURCE_DIR, f))]
    moved_count = 0
    
    for filename in files:
        if filename == ".DS_Store":
            continue
            
        dest_sub = route_file(filename)
        if dest_sub:
            dest_dir = os.path.join(BASE_DIR, dest_sub)
            src_path = os.path.join(SOURCE_DIR, filename)
            dest_path = os.path.join(dest_dir, filename)
            
            if DRY_RUN:
                print(f"[DRY RUN] Move: '{filename}' -> '{dest_sub}/'")
            else:
                os.makedirs(dest_dir, exist_ok=True)
                if os.path.exists(dest_path):
                    print(f"[SKIPPED] File already exists at destination: {dest_sub}/{filename}")
                else:
                    shutil.move(src_path, dest_path)
                    print(f"[MOVED] {filename} -> {dest_sub}/")
            moved_count += 1
            
    print(f"Total mapped files: {moved_count}/{len(files)}")

if __name__ == "__main__":
    main()
