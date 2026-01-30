const people = [
    '凯瑟琳·约翰逊: 数学家',
    '马里奥·莫利纳: 化学家',
    '穆罕默德·阿卜杜勒·萨拉姆: 物理学家',
    '珀西·莱温·朱利亚: 化学家',
    '苏布拉马尼扬·钱德拉塞卡: 天体物理学家',
];
let key = 0;

export default function List() {
    let items = [];
    for (let i = 0; i < people.length; i++) {
        let li = <li key={key}>{people[i]}</li>;
        items.push(li);
        key++;
    }
    return <ul>{items}</ul>;
}
