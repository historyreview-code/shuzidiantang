#!/bin/bash
# 双击启动旅行控制台
cd "$(dirname "$0")"
python3 console.py
read -r -p "控制台已退出，按回车关闭窗口..."
