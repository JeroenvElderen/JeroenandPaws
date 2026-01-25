import React from "react";

const VirtualizedList = React.forwardRef(
  (
    {
      itemCount,
      itemSize,
      maxHeight = 320,
      className = "",
      role,
      ariaLabel,
      innerPadding = 0,
      overscanCount = 4,
      renderItem,
      itemData,
      outerRef,
    },
    ref
  ) => {
    const containerRef = React.useRef(null);
    const [scrollTop, setScrollTop] = React.useState(0);

    const totalHeight = itemCount * itemSize + innerPadding * 2;
    const height = Math.min(totalHeight, maxHeight);

    React.useImperativeHandle(ref, () => ({
      scrollToItem: (index) => {
        if (!containerRef.current) return;
        const itemTop = innerPadding + index * itemSize;
        const itemBottom = itemTop + itemSize;
        const viewTop = containerRef.current.scrollTop;
        const viewBottom = viewTop + height;

        if (itemTop < viewTop) {
          containerRef.current.scrollTop = itemTop;
        } else if (itemBottom > viewBottom) {
          containerRef.current.scrollTop = itemBottom - height;
        }
      },
    }));

    const handleScroll = (event) => {
      setScrollTop(event.currentTarget.scrollTop);
    };

    const effectiveScrollTop = Math.max(scrollTop - innerPadding, 0);
    const startIndex = Math.max(
      Math.floor(effectiveScrollTop / itemSize) - overscanCount,
      0
    );
    const effectiveViewportBottom = Math.max(
      scrollTop + height - innerPadding,
      0
    );
    const endIndex = Math.min(
      Math.ceil(effectiveViewportBottom / itemSize) + overscanCount,
      itemCount - 1
    );

    const items = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
      items.push(
        renderItem({
          index,
          data: itemData,
          style: {
            position: "absolute",
            top: innerPadding + index * itemSize,
            height: itemSize,
            width: "100%",
          },
        })
      );
    }

    const setCombinedRef = (node) => {
      containerRef.current = node;
      if (outerRef) {
        if (typeof outerRef === "function") {
          outerRef(node);
        } else {
          outerRef.current = node;
        }
      }
    };

    if (!itemCount) {
      return null;
    }

    return (
      <div
        ref={setCombinedRef}
        className={className}
        role={role}
        aria-label={ariaLabel}
        onScroll={handleScroll}
        style={{
          height,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            height: totalHeight,
            position: "relative",
          }}
        >
          {items}
        </div>
      </div>
    );
  }
);

VirtualizedList.displayName = "VirtualizedList";

export default VirtualizedList;