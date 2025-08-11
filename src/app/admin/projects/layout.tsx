export default function Layout(props: { grid: React.ReactNode; modal: React.ReactNode }) {
    return (
        <>
            {props.grid}
            {props.modal}
        </>
    );
}
