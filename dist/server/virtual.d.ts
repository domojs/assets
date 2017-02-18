import * as akala from 'akala-server';
export declare class VirtualAssetFactory extends akala.ComponentFactory<VirtualAsset> {
    constructor(config: any, bus: any);
    build(): VirtualAsset;
}
export declare class VirtualAsset extends akala.Component {
    constructor(bus?: SocketIO.Socket);
    getContent(name: string, callback: (content: string) => void): void;
    static getFile(modules: string[], asset: VirtualAsset, callback: Function): void;
    static watchThenBuild(modules: string[], asset: VirtualAsset, callback?: Function): void;
    static build(modules: string[], asset: VirtualAsset, callback?: Function): void;
    moduleRelativePath: string;
    route: string;
    name: string;
    tsconfig: string;
}
