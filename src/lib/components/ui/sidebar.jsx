import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils.js';
import { useIsMobile } from '../../use-mobile.js';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.jsx';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

const SidebarContext = createContext(null);

function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.');
	}
	return context;
}

/**
 * 对应原项目 src/lib/components/ui/sidebar/sidebar-provider.svelte
 */
function SidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange,
	className,
	style,
	children,
	...props
}) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = useState(false);
	const [_open, _setOpen] = useState(defaultOpen);
	const open = openProp ?? _open;

	const setOpen = useCallback(
		(value) => {
			const openState = typeof value === 'function' ? value(open) : value;
			if (openProp !== undefined) {
				onOpenChange?.(openState);
			} else {
				_setOpen(openState);
			}
			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[openProp, open]
	);

	const toggleSidebar = useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((value) => !value);
	}, [isMobile, setOpen]);

	useEffect(() => {
		function handleShortcutKeydown(event) {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		}
		window.addEventListener('keydown', handleShortcutKeydown);
		return () => window.removeEventListener('keydown', handleShortcutKeydown);
	}, [toggleSidebar]);

	const value = useMemo(
		() => ({
			state: open ? 'expanded' : 'collapsed',
			isMobile,
			open,
			setOpen,
			openMobile,
			setOpenMobile,
			toggleSidebar
		}),
		[open, isMobile, setOpen, openMobile, toggleSidebar]
	);

	return (
		<SidebarContext.Provider value={value}>
			<TooltipProvider delayDuration={0}>
				<div
					data-slot="sidebar-wrapper"
					style={
						{
							'--sidebar-width': SIDEBAR_WIDTH,
							'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
							...style
						}
					}
					className={cn('group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full', className)}
					{...props}
				>
					{children}
				</div>
			</TooltipProvider>
		</SidebarContext.Provider>
	);
}

const sidebarMenuButtonVariants = {
	base: 'peer/menu-button ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-clip rounded-md p-2 text-start text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
	variants: {
		variant: {
			default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
			outline:
				'bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_var(--sidebar-border)] hover:shadow-[0_0_0_1px_var(--sidebar-accent)]'
		},
		size: {
			default: 'h-8 text-sm',
			sm: 'h-7 text-xs',
			lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!'
		}
	},
	defaults: { variant: 'default', size: 'default' }
};

function sidebarMenuButtonClass({ variant = 'default', size = 'default' } = {}) {
	return cn(
		sidebarMenuButtonVariants.base,
		sidebarMenuButtonVariants.variants.variant[variant],
		sidebarMenuButtonVariants.variants.size[size]
	);
}

/**
 * 对应原项目 src/lib/components/ui/sidebar/sidebar.svelte
 */
function Sidebar({ className, side = 'left', variant = 'sidebar', collapsible = 'offcanvas', children, ...props }) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

	if (collapsible === 'none') {
		return (
			<div
				className={cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', className)}
				{...props}
			>
				{children}
			</div>
		);
	}

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
				<SheetContent
					data-sidebar="sidebar"
					data-slot="sidebar"
					data-mobile="true"
					className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
					style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE }}
					side={side}
				>
					<SheetHeader className="sr-only">
						<SheetTitle>Sidebar</SheetTitle>
						<SheetDescription>Displays the mobile sidebar.</SheetDescription>
					</SheetHeader>
					<div className="flex h-full w-full flex-col">{children}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			className="text-sidebar-foreground group peer hidden md:block"
			data-state={state}
			data-collapsible={state === 'collapsed' ? collapsible : ''}
			data-variant={variant}
			data-side={side}
			data-slot="sidebar"
		>
			{/* This is what handles the sidebar gap on desktop */}
			<div
				data-slot="sidebar-gap"
				className={cn(
					'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
					'group-data-[collapsible=offcanvas]:w-0',
					'group-data-[side=right]:rotate-180',
					variant === 'floating' || variant === 'inset'
						? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
						: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
				)}
			/>
			<div
				data-slot="sidebar-container"
				className={cn(
					'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
					side === 'left'
						? 'start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]'
						: 'end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]',
					// Adjust the padding for floating and inset variants.
					variant === 'floating' || variant === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
						: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s',
					className
				)}
				{...props}
			>
				<div
					data-sidebar="sidebar"
					data-slot="sidebar-inner"
					className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
				>
					{children}
				</div>
			</div>
		</div>
	);
}

function SidebarHeader({ className, ...props }) {
	return (
		<div data-slot="sidebar-header" data-sidebar="header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />
	);
}

function SidebarFooter({ className, ...props }) {
	return (
		<div data-slot="sidebar-footer" data-sidebar="footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />
	);
}

function SidebarContent({ className, ...props }) {
	return (
		<div
			data-slot="sidebar-content"
			data-sidebar="content"
			className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden', className)}
			{...props}
		/>
	);
}

function SidebarMenu({ className, ...props }) {
	return (
		<ul data-slot="sidebar-menu" data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
	);
}

function SidebarMenuItem({ className, ...props }) {
	return (
		<li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />
	);
}

/**
 * 对应原项目 src/lib/components/ui/sidebar/sidebar-menu-button.svelte
 */
function SidebarMenuButton({
	asChild = false,
	className,
	variant = 'default',
	size = 'default',
	isActive = false,
	tooltip,
	children,
	...props
}) {
	const Comp = asChild ? Slot : 'button';
	const { isMobile, state } = useSidebar();

	const button = (
		<Comp
			data-slot="sidebar-menu-button"
			data-sidebar="menu-button"
			data-size={size}
			data-active={isActive}
			className={cn(sidebarMenuButtonClass({ variant, size }), className)}
			{...props}
		>
			{children}
		</Comp>
	);

	if (!tooltip) {
		return button;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile} {...tooltip.props}>
				{tooltip.content}
			</TooltipContent>
		</Tooltip>
	);
}

function SidebarMenuSub({ className, ...props }) {
	return (
		<ul
			data-slot="sidebar-menu-sub"
			data-sidebar="menu-sub"
			className={cn(
				'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s px-2.5 py-0.5',
				'group-data-[collapsible=icon]:hidden',
				className
			)}
			{...props}
		/>
	);
}

export {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarFooter,
	SidebarContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	useSidebar,
	sidebarMenuButtonClass,
	//
	SidebarProvider as Provider,
	Sidebar as Root,
	SidebarHeader as Header,
	SidebarFooter as Footer,
	SidebarContent as Content,
	SidebarMenu as Menu,
	SidebarMenuItem as MenuItem,
	SidebarMenuButton as MenuButton,
	SidebarMenuSub as MenuSub
};
