#!/usr/bin/env python3

import os
import argparse
import logging
from typing import List, Tuple, Optional

class ProjectPathFinder:
    ROOT_MARKERS = ['package.json', 'tsconfig.json']
    
    @staticmethod
    def find_project_root(start_path: str = os.getcwd()) -> Optional[str]:
        current_path = os.path.abspath(start_path)
        
        while current_path != '/':
            if any(os.path.exists(os.path.join(current_path, marker)) 
                  for marker in ProjectPathFinder.ROOT_MARKERS):
                return current_path
            current_path = os.path.dirname(current_path)
        return None

class ModuleCreator:
    def __init__(self, module_base_path: str = "src/modules"):
        self.setup_logging()
        project_root = ProjectPathFinder.find_project_root()
        
        if not project_root:
            raise ValueError("Could not find project root (no package.json or tsconfig.json found)")
            
        self.base_path = os.path.join(project_root, module_base_path)
        logging.info(f"Project root found at: {project_root}")
        logging.info(f"Modules will be created in: {self.base_path}")
        
    def setup_logging(self) -> None:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
    def get_module_files(self, module_name: str) -> List[str]:
        return [
            f"{module_name}.interface.ts",
            f"{module_name}.model.ts",
            f"{module_name}.routes.ts",
            f"{module_name}.service.ts",
            f"{module_name}.controller.ts",
            f"{module_name}.utils.ts"
        ]
    
    def create_module(self, module_name: str) -> Tuple[bool, str]:
        try:
            # Ensure base modules directory exists
            os.makedirs(self.base_path, exist_ok=True)
            
            # Create module directory
            module_path = os.path.join(self.base_path, module_name)
            
            if os.path.exists(module_path):
                return False, f"Module '{module_name}' already exists at {module_path}"
            
            os.makedirs(module_path, exist_ok=True)
            logging.info(f"Created directory: {module_path}")
            
            # Create module files
            for file_name in self.get_module_files(module_name):
                file_path = os.path.join(module_path, file_name)
                with open(file_path, 'w') as f:
                    f.write('')
                logging.info(f"Created file: {file_path}")
                
            return True, f"Successfully created module '{module_name}'"
            
        except PermissionError:
            return False, "Permission denied: Unable to create directory or files"
        except OSError as e:
            return False, f"Error creating module: {str(e)}"

def main() -> None:
    parser = argparse.ArgumentParser(description="Create a new module with standard files")
    parser.add_argument("--module", required=True, help="Name of the module to create")
    
    args = parser.parse_args()
    
    try:
        creator = ModuleCreator()
        success, message = creator.create_module(args.module)
        
        if success:
            logging.info(message)
        else:
            logging.error(message)
    except ValueError as e:
        logging.error(str(e))
        exit(1)

if __name__ == "__main__":
    main()