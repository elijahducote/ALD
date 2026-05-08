type Primitive = string | number | boolean | bigint;
type PropValue = Primitive | ((e: Event) => void) | null;
type Props = { [key: string]: PropValue };
type ChildDom = Primitive | Element | Node | Text | null | undefined | ChildDom[];
type TagFunc = (first?: Props | ChildDom, ...rest: ChildDom[]) => Element;
type VanTags = { [tagName: string]: TagFunc };

export {
  Props,
  ChildDom,
  VanTags
};