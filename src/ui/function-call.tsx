export const FunctionCall = (props: { name: string }) => {
	return (
		<>
			<p
				class="badge secondary inline-flex font-mono"
				aria-label={`Ran ${props.name} function.`}
			>
				{props.name}()
			</p>
			{"\n\n"}
		</>
	);
};
