import { useState, useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { nl } from 'date-fns/locale'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

import { useAuthContext } from '../context/AuthContext'
import { useBook } from '../hooks/useBooks'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'

import { Layout } from '../components/layout/Layout'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { Badge } from '../components/common/Badge'

import { TransactionItem } from '../components/transactions/TransactionItem'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { TransactionStats } from '../components/transactions/TransactionStats'
import { CategoryCard } from '../components/categories/CategoryCard'
import { CategoryForm } from '../components/categories/CategoryForm'
import { BookForm } from '../components/books/BookForm'
import { InviteForm } from '../components/books/InviteForm'
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart'
import { CategoryBarChart } from '../components/charts/CategoryBarChart'

import { assignCategory } from '../services/transactionService'

// Draggable wrapper for TransactionItem
function DraggableTransaction({ transaction, bookId, onEdit, categories }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: transaction.id,
    data: { transaction },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <TransactionItem
        transaction={transaction}
        bookId={bookId}
        onEdit={onEdit}
        categories={categories}
      />
    </div>
  )
}

export function BookDetailPage() {
  const { bookId } = useParams()
  const { user } = useAuthContext()
  const { book, loading: bookLoading } = useBook(bookId)
  const { transactions, loading: txLoading } = useTransactions(bookId)
  const { categories, loading: catLoading } = useCategories(bookId)

  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [activeTab, setActiveTab] = useState('transactions') // 'transactions' | 'categories' | 'charts'
  const [showTxForm, setShowTxForm] = useState(false)
  const [showCatForm, setShowCatForm] = useState(false)
  const [showBookForm, setShowBookForm] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [activeDragTx, setActiveDragTx] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd),
    [transactions, monthStart, monthEnd]
  )

  const spentPerCategory = useMemo(() => {
    const map = {}
    transactions.forEach((t) => {
      if (t.type === 'expense' && t.categoryId) {
        map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
      }
    })
    return map
  }, [transactions])

  async function handleDragEnd({ active, over }) {
    setActiveDragTx(null)
    if (!over) return
    const transactionId = active.id
    const categoryId = over.id
    await assignCategory(bookId, transactionId, categoryId)
  }

  function handleDragStart({ active }) {
    const tx = transactions.find((t) => t.id === active.id)
    setActiveDragTx(tx ?? null)
  }

  if (bookLoading) return <Layout><LoadingSpinner /></Layout>
  if (!book) return <Navigate to="/" replace />
  if (!book.memberIds?.includes(user?.uid)) return <Navigate to="/" replace />

  const isOwner = book.ownerId === user.uid
  const loading = txLoading || catLoading

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">← Terug</Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{book.name}</h1>
          {book.description && (
            <p className="text-slate-500 text-sm mt-0.5">{book.description}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" className="text-xs" onClick={() => setShowInvite(true)}>
              👥 Uitnodigen
            </Button>
            <Button variant="secondary" className="text-xs" onClick={() => setShowBookForm(true)}>
              ✎ Bewerken
            </Button>
          </div>
        )}
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" className="px-2" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
          ‹
        </Button>
        <span className="font-medium text-slate-700 min-w-32 text-center">
          {format(selectedMonth, 'MMMM yyyy', { locale: nl })}
        </span>
        <Button variant="ghost" className="px-2" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
          ›
        </Button>
      </div>

      {/* Stats */}
      {!loading && <TransactionStats transactions={monthTransactions} />}

      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { key: 'transactions', label: 'Transacties' },
          { key: 'categories', label: 'Categorieën' },
          { key: 'charts', label: 'Grafieken' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Transactions tab */}
          {activeTab === 'transactions' && (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="font-medium text-slate-700 text-sm">
                    {monthTransactions.length} transacties
                  </span>
                  <Button className="text-xs px-3 py-1.5" onClick={() => { setEditTx(null); setShowTxForm(true) }}>
                    + Toevoegen
                  </Button>
                </div>

                {monthTransactions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Geen transacties in {format(selectedMonth, 'MMMM', { locale: nl })}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {monthTransactions.map((tx) => (
                      <DraggableTransaction
                        key={tx.id}
                        transaction={tx}
                        bookId={bookId}
                        onEdit={(t) => { setEditTx(t); setShowTxForm(true) }}
                        categories={categories}
                      />
                    ))}
                  </div>
                )}
              </div>

              <DragOverlay>
                {activeDragTx && (
                  <div className="bg-white border border-indigo-300 rounded-lg px-4 py-2 shadow-lg text-sm opacity-90">
                    {activeDragTx.description || 'Transactie'} — €{activeDragTx.amount.toFixed(2)}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Categories tab */}
          {activeTab === 'categories' && (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">
                  Sleep transacties naar een categorie om ze te koppelen
                </span>
                <Button className="text-xs px-3 py-1.5" onClick={() => { setEditCat(null); setShowCatForm(true) }}>
                  + Categorie
                </Button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <span className="text-3xl">🏷️</span>
                  <p className="mt-2 text-sm">Nog geen categorieën aangemaakt</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      bookId={bookId}
                      spent={spentPerCategory[cat.id] ?? 0}
                      onEdit={(c) => { setEditCat(c); setShowCatForm(true) }}
                    />
                  ))}
                </div>
              )}

              <DragOverlay>
                {activeDragTx && (
                  <div className="bg-white border border-indigo-300 rounded-lg px-4 py-2 shadow-lg text-sm">
                    {activeDragTx.description || 'Transactie'} — €{activeDragTx.amount.toFixed(2)}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Charts tab (nice-to-have 2.4) */}
          {activeTab === 'charts' && (
            <div className="flex flex-col gap-4">
              <MonthlyLineChart transactions={monthTransactions} selectedMonth={selectedMonth} />
              <CategoryBarChart transactions={transactions} categories={categories} />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={showTxForm}
        onClose={() => { setShowTxForm(false); setEditTx(null) }}
        title={editTx ? 'Transactie bewerken' : 'Transactie toevoegen'}
      >
        <TransactionForm
          bookId={bookId}
          transaction={editTx}
          categories={categories}
          onClose={() => { setShowTxForm(false); setEditTx(null) }}
        />
      </Modal>

      <Modal
        isOpen={showCatForm}
        onClose={() => { setShowCatForm(false); setEditCat(null) }}
        title={editCat ? 'Categorie bewerken' : 'Categorie aanmaken'}
      >
        <CategoryForm
          bookId={bookId}
          category={editCat}
          onClose={() => { setShowCatForm(false); setEditCat(null) }}
        />
      </Modal>

      <Modal isOpen={showBookForm} onClose={() => setShowBookForm(false)} title="Boekje bewerken">
        <BookForm book={book} onClose={() => setShowBookForm(false)} />
      </Modal>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Deelnemers beheren">
        <InviteForm book={book} />
      </Modal>
    </Layout>
  )
}
