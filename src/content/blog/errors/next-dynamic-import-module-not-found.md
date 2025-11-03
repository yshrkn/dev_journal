---
title: 'Next.js 15でdynamic import時に「Module not found」エラーになったときの対処'
description: 'Next.js 15でdynamic importを使った際に発生する「Module not found」エラーの原因と対処方法をまとめます。'
pubDate: '2025/11/03'
tags: ['Next.js', 'Dynamic Import', 'エラー対処']
---

## 経緯

自作のコンポーネントライブラリ（@test/ui）からコンポーネントを[ダイナミックインポート](https://nextjs.org/docs/app/guides/lazy-loading#nextdynamic)した際に Module not found エラーが発生。

ちなみにコンポーネントライブラリは[サーバコンポーネント](https://ja.react.dev/reference/rsc/server-components)か否かで読み込みパスを @test/ui/client, @test/ui/server に読み込みパスを分ける設計。

**package.json（ライブラリ側）**

```js
{
  "name": "@test/ui",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    //
    "./client": {
      "types": "./dist/components/client/index.d.ts",
      "import": "./dist/client.js"
    },
    "./server": {
      "types": "./dist/components/server/index.d.ts",
      "import": "./dist/server.js"
    },
    "./style.css": "./dist/style.css"
  },
  // 省略
}
```

**vite.config.base.ts**

```ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfig from './tsconfig.build.json';

export const baseConfig = defineConfig({
  // 省略
  build: {
    lib: {
      formats: ['es'],
    },
  },
});
```

**Next.js 側のコード**

```tsx
'use client';

import dynamic from 'next/dynamic';

// ❌️ Module not found エラー
const DynamicHoge = dynamic(() => import('@test/ui/client').then((mod) => mod.Hoge), {
  ssr: false,
});

// ✅️ 通常読み込みはエラーにならない
import { Hoge } from '@test/ui';
```

## 環境

| 項目                 | 内容    |
| -------------------- | ------- |
| Next.js              | 15.5.6  |
| Node.js              | 22.18.0 |
| フロントビルドツール | Vite    |

## エラーメッセージ

```
Module not found. Package path ./client is not exported from package ~
```

## 原因

Vite のビルド設定 CommoJS('cjs')形式を出力してしていなかったことが原因。

## 対処方法

vite.config.base.ts の build.lib.formats に'cjs'を追加し、ESM と CJS 両方の形式をビルドすることで解決。  
併せて コンポーネントライブラリ側の package.json の exports に CJS 用のパスも追加する。

**vite.config.base.ts**

```ts
export const baseConfig = defineConfig({
  // 省略
  build: {
    lib: {
      formats: ['es', 'cjs'], // ← CommonJSも出力
    },
  },
});
```

**package.json（ライブラリ側）**

```js
{
  "name": "@test/ui",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    //
    "./client": {
      "types": "./dist/components/client/index.d.ts",
      "import": "./dist/client.js",
      "require": "./dist/client.cjs" // ← CJS用のパスを追加
    },
    "./server": {
      "types": "./dist/components/server/index.d.ts",
      "import": "./dist/server.js",
      "require": "./dist/client.cjs" // ← CJS用のパスを追加
    },
    "./style.css": "./dist/style.css"
  },
  // 省略
}
```
