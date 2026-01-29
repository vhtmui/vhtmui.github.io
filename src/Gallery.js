
export function Profile({ text, size, alt }) {
    return (
        <div>
            <img
                src="https://picx.zhimg.com/v2-d6f44389971daab7e688e5b37046e4e4_720w.jpg?source=172ae18b"
                className="circle-img"
                style={{ borderRadius: "50%", width: size, height: size, objectFit: "cover" }}
                alt={alt}
            />
            <text>{text}</text>
        </div>
    );
}