import { Fragment } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import * as Breadcrumb from '@ui/breadcrumb.jsx';
import { stripBase } from '@lib/my-utils.js';

const githubUrl = 'vhtmui.github.io';

/** 对应原项目 src/lib/components/my/Navigator.svelte（面包屑导航） */
export default function Navigator() {
	// 路由变化时重新渲染
	useLocation();

	let pn_array = stripBase(window.location.pathname).split('/').filter(Boolean);

	let hasGithubUrl = false;
	if (pn_array.includes(githubUrl)) {
		pn_array = pn_array.slice(pn_array.indexOf(githubUrl));
		hasGithubUrl = true;
	}

	const pn = pn_array.map((pathname, index) => {
		let name = pathname;
		let href = '/' + pn_array.slice(0, index + 1).join('/');
		return { name, href };
	});

	if (hasGithubUrl) {
		pn[0] = { name: 'Home', href: '/' + githubUrl };
	} else {
		pn.unshift({ name: 'Home', href: '/' });
	}

	return (
		<div className="mr-auto w-full">
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{pn.map((item, i) => (
						<Fragment key={item.href}>
							<Breadcrumb.Item>
								{i === pn.length - 1 ? (
									<Breadcrumb.Page>{item.name}</Breadcrumb.Page>
								) : (
									<Breadcrumb.Link>
										<Link to={item.href} className="hover:text-foreground transition-colors">
											{item.name}
										</Link>
									</Breadcrumb.Link>
								)}
							</Breadcrumb.Item>
							{i !== pn.length - 1 && <Breadcrumb.Separator />}
						</Fragment>
					))}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>
	);
}
