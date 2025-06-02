// ModalContext.tsx
'use client'
import React, { createContext, useState, useContext, ReactNode } from 'react'
import { Product } from '@/app/interfaces/interfaces'

type ModalContextType = {
  isModalOpen: boolean
  openModal: (product: Product) => void
  closeModal: () => void
  modalProduct: Product | null
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  const openModal = (product: Product) => {
    setModalProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal, modalProduct }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}