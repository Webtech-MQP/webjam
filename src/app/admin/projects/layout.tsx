export default function Layout(props: { grid: React.ReactNode; modal: React.ReactNode }) {
    return (
        <div>
            <div>{props.grid}</div>
            <div>{props.modal}</div>
        </div>
    );
}
