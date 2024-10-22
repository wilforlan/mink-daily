import type { QueueItem } from '../types';

/**
 * Priority Queue implementation with heap as internal storage for nodes
 */
export class PriorityQueue<K extends QueueItem> {
  private nodes: K[] = [];

  /**
   * get the total number of nodes in the queue
   * @returns {number} the number of nodes in the queue
   */
  public get size(): number {
    return this.nodes.length;
  }

  /**
   * clear the queue
   */
  public clear(): void {
    this.nodes = [];
  }

  /**
   * adds a value to the heap and performs a re heap of the queue
   * @param {K} val the value to insert into the heap
   */
  public insert(val: K) {
    this.nodes.push(val);
    let idx = this.nodes.length - 1;
    while (idx > 0) {
      const parentIndex = this.parent(idx);
      // if the parent node has lower priority than the child it's in the right
      // order no need to swap again.
      if (this.nodes[parentIndex].priority < this.nodes[idx].priority) break;
      const tmp = this.nodes[parentIndex];
      this.nodes[parentIndex] = this.nodes[idx];
      this.nodes[idx] = tmp;
      idx = parentIndex;
    }
  }

  /**
   * pops the node with least priority from the queue and returns it
   * @returns {K | null | undefined} the element with the smallest priority
   */
  public pop(): K | null | undefined {
    if (this.nodes.length === 0) return null;
    this.swap(0, this.nodes.length - 1);
    const topItem = this.nodes.pop();
    let currentIndex = 0;
    while (this.hasLeft(currentIndex)) {
      let smallestChild = this.left(currentIndex);
      if (
        this.hasRight(currentIndex) &&
        this.nodes[this.right(currentIndex)].priority < this.nodes[smallestChild].priority
      ) {
        smallestChild = this.right(currentIndex);
      }
      if (this.nodes[currentIndex].priority < this.nodes[smallestChild].priority) {
        break;
      }
      this.swap(currentIndex, smallestChild);
      currentIndex = smallestChild;
    }
    return topItem;
  }

  /**
   * Returns the node with the lowest priority or null if the nodes are empty
   * @returns {K | null}
   */
  public peak(): K | null {
    if (this.nodes.length === 0) return null;
    return this.nodes[0];
  }

  /**
   * Returns all nodes
   * @returns {K[]}
   */
  public inspect(): K[] {
    return this.nodes;
  }

  /**
   * get the index of the parent node of node at a given index
   * @param {number} index  index of the node to find parent for
   * @returns {number} the index of the parent node
   */
  private parent = (index: number): number => Math.floor((index - 1) / 2);

  /**
   * get the index to the left node
   * @param {number} index index of node to get left child index for
   * @returns {number} the index of left node
   */
  private left = (index: number): number => 2 * index + 1;

  /**
   * get the index to the right node
   * @param {number} index index of node to get right child index for
   * @returns {number} the index of right node
   */
  private right = (index: number): number => 2 * index + 2;

  /**
   * checks to see if the node has a left child
   * @param {number} index the index of node to check if it has left node
   * @returns {boolean} boolean indicating if the node has a left child
   */
  private hasLeft = (index: number): boolean => this.left(index) < this.nodes.length;

  /**
   * checks to see if the node has a right child
   * @param {number} index the index of node to check if it has right node
   * @returns {boolean} boolean indicating if the node has a right child
   */
  private hasRight = (index: number): boolean => this.right(index) < this.nodes.length;

  /**
   * Swaps the node values at given indexes
   * @param {number} a index of element to swap from
   * @param {number} b index of element to swap to
   */
  private swap(a: number, b: number) {
    const tmp = this.nodes[a];
    this.nodes[a] = this.nodes[b];
    this.nodes[b] = tmp;
  }
}
