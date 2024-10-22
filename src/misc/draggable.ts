export function draggableElement(
  elmnt: HTMLDivElement,
  document: Document,
  onDragStart?: () => void,
  onDragEnd?: () => void,
): void {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;
  function closeDragElement(): void {
    document.onmouseup = null;
    document.onmousemove = null;
    onDragEnd?.();
  }

  function elementDrag(e: MouseEvent): void {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
    elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
  }

  function dragMouseDown(e: MouseEvent): void {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    onDragStart?.();
  }

  if (elmnt) elmnt.onmousedown = dragMouseDown;
}
