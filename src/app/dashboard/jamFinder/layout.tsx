interface Props {
    modal: React.ReactNode;
    rest: React.ReactNode;
}

export default function Layout({ modal, rest }: Props) {
    return (
        <>
            <div className="h-full">{rest}</div>
            {modal}
        </>
    );
}
