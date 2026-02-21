import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

# 目錄與檔案設定
DATA_DIR = "public/data"
INDEX_FILE = "public/files.json"
TARGET_URL = "https://www.pilio.idv.tw/lto539/list.asp"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def fetch_web_data():
    print(f"📡 正在抓取網頁資料...")
    try:
        res = requests.get(TARGET_URL, headers=HEADERS)
        res.encoding = 'big5'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        extracted = []
        # 尋找所有資料列 (包含 date-cell 的 tr)
        rows = soup.find_all('tr')
        
        for row in rows:
            date_td = row.find('td', class_='date-cell')
            num_td = row.find('td', class_='number-cell')
            
            if date_td and num_td:
                # 1. 處理日期 (格式如: 02/19\n26(四))
                # 我們需要把 02/19 和 26 拼湊成 2026/02/19
                raw_date_text = date_td.get_text("|", strip=True) # 使用 | 分隔 br 標籤
                parts = raw_date_text.split("|")
                if len(parts) >= 2:
                    month_day = parts[0] # "02/19"
                    year_short = parts[1][:2] # "26"
                    full_date = f"20{year_short}/{month_day}" # "2026/02/19"
                else:
                    continue

                # 2. 處理號碼 (格式如: 08, 15, 19, 25, 27)
                raw_nums = num_td.get_text(strip=True).replace("\xa0", "") # 去除 &nbsp;
                try:
                    num_list = [int(n.strip()) for n in raw_nums.split(',')]
                    if len(num_list) == 5:
                        print(f"✨ 找到資料: {full_date} -> {num_list}")
                        extracted.append({"date": full_date, "numbers": num_list})
                except:
                    continue
                    
        return extracted
    except Exception as e:
        print(f"❌ 抓取失敗: {e}")
        return []

def update_json_data(new_records):
    if not new_records:
        print("⚠️ 警告：未抓取到任何資料，請檢查網頁是否改版。")
        return

    # 讀取索引檔
    index_list = []
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, 'r', encoding='utf-8') as f:
            index_list = json.load(f)

    # 依日期由舊到新處理，確保追加順序正確
    new_records.sort(key=lambda x: x['date'])

    for record in new_records:
        year = record['date'].split('/')[0]
        data_file_path = os.path.join(DATA_DIR, f"lottery_{year}.json")
        
        year_data = []
        if os.path.exists(data_file_path):
            with open(data_file_path, 'r', encoding='utf-8') as f:
                year_data = json.load(f)
        
        # 檢查重複
        if not any(item['date'] == record['date'] for item in year_data):
            year_data.append(record)
            # 存檔時由新到舊排 (最新在上面)
            year_data.sort(key=lambda x: x['date'], reverse=True)
            with open(data_file_path, 'w', encoding='utf-8') as f:
                json.dump(year_data, f, indent=2, ensure_ascii=False)
            print(f"✅ 已存檔: {record['date']}")
            
            # 更新索引
            rel_path = f"lottery_{year}.json"
            if not any(idx['year'] == year for idx in index_list):
                index_list.append({"name": rel_path, "year": year})
                index_list.sort(key=lambda x: x['year'], reverse=True)
                with open(INDEX_FILE, 'w', encoding='utf-8') as f:
                    json.dump(index_list, f, indent=2, ensure_ascii=False)
        else:
            print(f"⏭️ {record['date']} 已存在，跳過。")

if __name__ == "__main__":
    records = fetch_web_data()
    update_json_data(records)
    print("🏁 執行完畢")