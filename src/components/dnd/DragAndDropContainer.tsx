import { useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'

/**
 * DraggableItem — wraps any child with drag behaviour.
 *
 * Props:
 *   id        {string}  — unique drag id
 *   data      {object}  — arbitrary data passed to onDragEnd
 *   children  {node}
 *   className {string}
 */
export function DraggableItem({ id, data, children, className = '' }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data })

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''} ${className}`}
        >
            {children}
        </div>
    )
}

/**
 * DroppableArea — wraps any child making it a valid drop target.
 *
 * Props:
 *   id        {string}  — unique droppable id (matched in onDragEnd over.id)
 *   children  {node | (isOver: boolean) => node}
 *   className {string}
 */
export function DroppableArea({ id, children, className = '' }) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div ref={setNodeRef} className={className}>
            {typeof children === 'function' ? children(isOver) : children}
        </div>
    )
}

/**
 * DndContainer — top-level context + DragOverlay in one.
 *
 * Props:
 *   onDragEnd   {({ active, over }) => void}
 *   renderOverlay {(activeData) => node} — what to show while dragging
 *   children    {node}
 */
export function DndContainer({ onDragEnd, renderOverlay, children }) {
    const [activeData, setActiveData] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    function handleDragStart({ active }) {
        setActiveData(active.data?.current ?? null)
    }

    function handleDragEnd(event) {
        setActiveData(null)
        onDragEnd(event)
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {children}
            {renderOverlay && (
                <DragOverlay>
                    {activeData ? renderOverlay(activeData) : null}
                </DragOverlay>
            )}
        </DndContext>
    )
}