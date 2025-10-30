import React, { useState } from 'react'
import type { Variation, Sku } from '../../typings/variation'
import styles from './styles.css'
import SkuSelector from '../SkuSelector'
import { Modal } from 'vtex.styleguide'

interface Props {
  isOpen: boolean
  onClose: () => void
  products: Variation[]
  ordinalPosition: string
  onSelectProduct: (product: Variation, selectedSku: Sku) => void
  onRemoveProduct: () => void
  currentSelectedProduct?: { product: Variation; sku: Sku }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const transformImageUrl = (imageUrl: string, width: number = 400) => {
  const url = new URL(imageUrl)
  const imageId = url.pathname.match(/\/ids\/(\d+)/)?.[1]
  if (!imageId) return imageUrl

  const version =
    new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8) + '0000'
  const baseUrl = `${url.protocol}//${url.host}`

  return `${baseUrl}/arquivos/ids/${imageId}-${width}-auto?v=${version}&width=${width}&height=auto&aspect=true`
}

const ProductSelectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  ordinalPosition,
  onSelectProduct,
  onRemoveProduct,
  currentSelectedProduct,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    currentSelectedProduct?.product.productId ?? null
  )
  const [selectedSkus, setSelectedSkus] = useState<{ [key: number]: Sku }>(
    currentSelectedProduct
      ? { [currentSelectedProduct.product.productId]: currentSelectedProduct.sku }
      : {}
  )
  const [isAdding, setIsAdding] = useState<number | null>(null)

  const handleProductSelect = (product: Variation) => {
    const sku = selectedSkus[product.productId] ||
      product.skus.find((sku) => sku.available) ||
      product.skus[0]

    setIsAdding(product.productId)

    setTimeout(() => {
      onSelectProduct(product, sku)
      setIsAdding(null)
      onClose()
    }, 500)
  }

  const handleSkuChange = (productId: number, newSku: Sku) => {
    setSelectedSkus((prev) => ({ ...prev, [productId]: newSku }))
  }

  const removeSelected = () => {
    setSelectedSkus({})
    setSelectedProductId(null)
    onRemoveProduct()
  }

  return (
    <Modal isOpen={isOpen} centered>
      <div className={styles['modal-container']}>
        <div className={styles["modal-close"]}>
          <h2 className={styles['modal-title']}>
            Selecciona tu {ordinalPosition} producto
          </h2>
          <span className={styles["modal-close-icon"]} onClick={onClose} ><img src="https://oneillco.vteximg.com.br/arquivos/close_modal.svg" alt="close"/></span>
        </div>
        <div className={styles['modal-products-grid']}>
          {products.map((product) => {
            const isSelected = selectedProductId === product.productId
            const selectedSku =
              selectedSkus[product.productId] ||
              product.skus.find((s) => s.available) ||
              product.skus[0]

            return (
              <div
                key={product.productId}
                className={`${styles['modal-product-card']} ${
                  isSelected ? styles['modal-product-selected'] : ''
                }`}
              >
                <div className={styles['modal-product-image']}>
                  <img
                    src={transformImageUrl(selectedSku.image, 400)}
                    alt={product.name}
                  />
                </div>
                <div className={styles['modal-product-info']}>
                  <h3 className={styles['modal-product-name']}>
                    {product.name}
                  </h3>
                  <div className={styles['modal-product-price']}>
                    {formatPrice(selectedSku.bestPrice / 100)}
                  </div>
                  <SkuSelector
                    variation={product}
                    selectedSku={selectedSku}
                    onSkuChange={(newSku) =>
                      handleSkuChange(product.productId, newSku)
                    }
                  />
                  <div className={styles["modal-product-reference"]}>
                    Referencia: 1N00297-0000-XS
                  </div>
                  <button
                    className={`${
                      isSelected ? styles['modal-selected-button'] : styles['modal-select-button']
                    } ${isAdding === product.productId ? styles['modal-adding-button'] : ''}`}
                    onClick={() => handleProductSelect(product)}
                    disabled={isSelected || isAdding !== null}
                  >
                    {isAdding === product.productId && (
                      <div className={styles['progress-bar']}/>
                    )}
                    <span style={{position: 'relative', zIndex: 1}}>
                      {isAdding === product.productId ? 'Añadiendo' : isSelected ? 'Seleccionado' : 'Seleccionar'}
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles['modal-actions']}>
        <button className={styles['modal-cancel-button']} onClick={onClose}>
          Cancelar
        </button>
        {currentSelectedProduct ? (
          <button
            className={styles['modal-remove-button']}
            onClick={removeSelected}
          >
            Eliminar producto
          </button>
        ) : (
          <span className={styles['modal-info-text']}>
            Añade un producto de la colección
          </span>
        )}
      </div>
    </Modal>
  )
}

export default ProductSelectionModal
