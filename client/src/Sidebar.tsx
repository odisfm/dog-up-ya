export default function Sidebar({ visible }: { visible: boolean }) {
    return (
        <div
            style={{
                transform: visible ? "translateX(0)" : "translateX(100%)",
                transition: "transform 100ms ease-in-out",
            }}
            className="absolute top-0 right-0 h-full w-screen md:w-2/3 lg:w-1/3 z-50 bg-black text-white flex flex-col"
        >
            <div className="flex-1 overflow-y-scroll pb-12">
                <ul>
                    <li>one</li>
                    <li>two</li>
                    <li>three</li>
                    <li>four</li>
                    <li>five</li>
                    <li>six</li>
                    <li>seven</li>
                    <li>eight</li>
                    <li>nine</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>seven</li>
                    <li>eight</li>
                    <li>nine</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>seven</li>
                    <li>eight</li>
                    <li>nine</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>seven</li>
                    <li>eight</li>
                    <li>nine</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>seven</li>
                    <li>eight</li>
                    <li>nine</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>seven</li>
                    <li>eight</li>
                    <li>nine</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>ten</li>
                    <li>the end</li>
                </ul>
            </div>
        </div>
    );
}