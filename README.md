# 🌤️ 天気比較・気温予測アプリケーション

今日の天気・気温と1年前、10年前、20年前、30年前、40年前の気温・天気を比較できるWebアプリケーションです。過去のデータから機械学習による気温トレンド予測機能も搭載しています。

## 📋 概要

このプロジェクトは、気象庁の過去データを活用して、今日の天気と過去の天気を比較し、さらにAIによる気温予測を提供するWebアプリケーションです。

### 主な機能

- **今日の天気表示**: 気象庁APIから取得した最新の天気予報
- **過去の天気比較**: 1年前、10年前、20年前、30年前、40年前の同日の天気データを表示
- **気温グラフ**: 複数年度の月平均気温を比較するグラフ
- **AI気温予測**: 過去10年のデータを基に、今月・来月・再来月の気温トレンドを予測
- **過去7日間のデータ表示**: 最近の天気履歴を確認
- **類似天気検索**: 過去の類似した天気パターンを検索

## 🤖 AI機能の詳細

### AI気温予測システム

本アプリケーションは、**機械学習**を使用して気温トレンドを予測する機能を搭載しています。

#### 技術仕様

- **使用アルゴリズム**: 線形回帰（Linear Regression）
- **機械学習ライブラリ**: scikit-learn
- **データソース**: 気象庁の過去10年分の月次平均気温データ
- **予測対象**: 今月・来月・再来月の気温トレンド

#### 予測ロジック

1. **データ収集**: 過去10年間の各月の平均気温データを収集
2. **モデル学習**: 線形回帰モデルを使用して、気温の年次トレンドを学習
3. **予測実行**: 学習したモデルから、今年の各月の予測気温を算出
4. **トレンド判定**: 
   - 予測気温が過去10年の平均より1℃以上高い場合 → 「暑くなる」
   - 予測気温が過去10年の平均より1℃以上低い場合 → 「寒くなる」
   - それ以外 → 「平年並み」
5. **信頼度計算**: 使用したデータ年数に基づいて信頼度を算出（最大100%）

#### 実装箇所

- **バックエンド**: `weather/utils.py` の `predict_temperature_trend()` 関数
- **APIエンドポイント**: `/predict-weather/`
- **フロントエンド**: `frontend/src/app/WeatherClient.tsx` のAI気温予測セクション

```python
# 使用例
from weather.utils import predict_temperature_trend

prediction = predict_temperature_trend()
# 戻り値:
# {
#     'success': True,
#     'current_month': {...},  # 今月の予測
#     'next_month': {...},     # 来月の予測
#     'next_next_month': {...}, # 再来月の予測
# }
```

## 🛠️ 技術スタック

### バックエンド
- **フレームワーク**: Django 5.0.6
- **言語**: Python 3.12
- **機械学習**: scikit-learn 1.5.0
- **データ処理**: pandas, numpy, scipy
- **Webスクレイピング**: BeautifulSoup4, requests
- **グラフ生成**: matplotlib
- **サーバー**: gunicorn

### フロントエンド
- **フレームワーク**: Next.js 14.2.4
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **HTTPクライアント**: Axios

### データソース
- **気象データ**: 気象庁公式サイト（https://www.data.jma.go.jp/）
- **天気予報API**: 気象庁の公開API

## 🚀 起動方法

### 前提条件

- Python 3.12以上
- Node.js 18以上
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd weather
```

### 2. バックエンドのセットアップ

```bash
# 仮想環境の作成（Windows）
python -m venv venv

# 仮想環境の有効化（Windows PowerShell）
.\venv\Scripts\Activate.ps1

# 仮想環境の有効化（Windows CMD）
venv\Scripts\activate.bat

# 依存パッケージのインストール
pip install -r requirements.txt

# データベースのマイグレーション（必要な場合）
python manage.py migrate

# 開発サーバーの起動
python manage.py runserver
```

バックエンドサーバーが `http://localhost:8000` で起動します。

### 3. フロントエンドのセットアップ

新しいターミナルウィンドウを開いて：

```bash
# frontendディレクトリに移動
cd frontend

# 依存パッケージのインストール
npm install

# 環境変数の設定（必要な場合）
# .env.local ファイルを作成
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 開発サーバーの起動
npm run dev
```

フロントエンドサーバーが `http://localhost:3000` で起動します。

### 4. アプリケーションへのアクセス

ブラウザで `http://localhost:3000` を開いてアプリケーションを使用できます。

## 📁 プロジェクト構造

```
weather/
├── frontend/                 # Next.jsフロントエンド
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx      # メインページ
│   │       ├── layout.tsx    # ルートレイアウト
│   │       ├── WeatherClient.tsx  # 天気表示コンポーネント
│   │       └── components/   # コンポーネント
│   ├── package.json
│   └── README.md
├── weather/                  # Djangoアプリ
│   ├── views.py             # APIビュー
│   ├── utils.py             # AI予測ロジック・データ取得処理
│   ├── models.py            # データモデル
│   └── __urls.py            # URL設定
├── weather_project/         # Djangoプロジェクト設定
│   ├── settings.py          # プロジェクト設定
│   └── urls.py              # ルートURL設定
├── requirements.txt         # Python依存パッケージ
├── manage.py                # Django管理スクリプト
└── README.md               # このファイル
```

## 🔌 APIエンドポイント

### バックエンドAPI (http://localhost:8000)

| エンドポイント | メソッド | 説明 |
|-------------|---------|------|
| `/weather-data/` | GET | 今日と過去の天気データを取得 |
| `/weather-graph/` | GET | 気温比較グラフ（Base64画像）を取得 |
| `/predict-weather/` | GET | AIによる気温トレンド予測を取得 |
| `/custom-week-weather/<weeks>/` | GET | 過去N週間の天気データを取得 |
| `/custom-year-weather/<years>/` | GET | N年前の天気データを取得 |
| `/health/` | GET | ヘルスチェック |

### APIレスポンス例

#### `/predict-weather/`

```json
{
  "success": true,
  "current_month": {
    "month": 12,
    "year": 2024,
    "predicted_temp": 10.5,
    "past_avg_temp": 9.8,
    "temp_diff": 0.7,
    "trend": "平年並み",
    "trend_en": "average",
    "confidence": 100
  },
  "next_month": {
    "month": 1,
    "year": 2025,
    "predicted_temp": 5.2,
    "past_avg_temp": 4.9,
    "temp_diff": 0.3,
    "trend": "平年並み",
    "trend_en": "average",
    "confidence": 100
  },
  "next_next_month": {...}
}
```

## 🌍 環境変数

### フロントエンド (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### バックエンド

Djangoの `settings.py` で設定可能です。本番環境では環境変数から読み込むことを推奨します。

## 📊 データソース

- **気象庁過去データ**: https://www.data.jma.go.jp/stats/etrn/view/daily_s1.php
- **気象庁天気予報API**: https://www.jma.go.jp/bosai/forecast/data/forecast/

## 🔧 開発

### バックエンドのテスト

```bash
python manage.py test
```

### フロントエンドのビルド

```bash
cd frontend
npm run build
npm start
```

### コードのリント

```bash
# フロントエンド
cd frontend
npm run lint
```

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。大きな変更の場合は、まずイシューを開いて変更内容を議論してください。

## 📧 お問い合わせ

プロジェクトに関する質問や提案があれば、イシューを作成してください。

---

**注意**: このアプリケーションは気象庁のデータを使用していますが、気象庁が公式に提供するものではありません。予測結果は参考情報であり、実際の天気予報とは異なる場合があります。

