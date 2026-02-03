export type StructureType = "Tunnel" | "Bridge";

export class Structure {
	constructor(
		public startDistance: number,
		public endDistance: number,
		public type: StructureType,
		public name: string,
	) {}
}