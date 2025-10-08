interface Props {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <>
            <div className="max-h-full overflow-auto">{children}</div>
        </>
    );
}
