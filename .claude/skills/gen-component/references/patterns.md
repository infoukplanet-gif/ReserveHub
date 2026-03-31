# コンポーネント設計パターン

## ローディング・エラー・空状態の3態

全データ表示コンポーネントで必ずハンドリングする:

```tsx
function CustomerList() {
  const { data, isLoading, error } = useQuery(...)

  if (isLoading) return <Skeleton />       // ローディング
  if (error) return <ErrorState error={error} />  // エラー
  if (!data?.length) return <EmptyState />  // 空状態

  return <div>{data.map(...)}</div>         // 正常
}
```

## フォームパターン

React Hook Form + Zod + shadcn/ui:

```tsx
const formSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('メールアドレスの形式が正しくありません'),
})

type FormValues = z.infer<typeof formSchema>

function MenuForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = async (values: FormValues) => {
    // API呼び出し
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '送信中...' : '保存'}
        </Button>
      </form>
    </Form>
  )
}
```

## テーブルパターン

shadcn/ui DataTable + TanStack Query:

```tsx
// ページネーション、ソート、フィルタを含むテーブル
// src/components/shared/DataTable.tsx として共通化

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading: boolean
  pagination: { page: number; perPage: number; total: number }
  onPageChange: (page: number) => void
}
```

## モーダル / シートパターン

作成・編集はSheet（右から出る）、確認はDialog:

```tsx
// 作成・編集 → Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button>新規作成</Button>
  </SheetTrigger>
  <SheetContent>
    <MenuForm />
  </SheetContent>
</Sheet>

// 確認・削除 → Dialog
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">削除</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    本当に削除しますか？
  </AlertDialogContent>
</AlertDialog>
```

## 料金表示パターン

```tsx
// 料金のフォーマット
function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

// 料金範囲の表示（メニュー一覧で使用）
function PriceRange({ min, max }: { min: number; max: number }) {
  if (min === max) return <span>{formatPrice(min)}</span>
  return <span>{formatPrice(min)}〜{formatPrice(max)}</span>
}
```
