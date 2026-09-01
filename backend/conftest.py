import sys
import os

# Add root directory to sys.path
root_dir = os.path.abspath(os.path.dirname(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

parent_dir = os.path.abspath(os.path.join(root_dir, ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
